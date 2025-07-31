from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import numpy as np
from scipy.signal import resample
import json
import asyncio
import threading

from app.utils.logger import logger

# Giả sử RealtimeSTT đã cài đặt trong PYTHONPATH
from RealtimeSTT import AudioToTextRecorder

router = APIRouter()

recorder = None
recorder_ready = threading.Event()

def decode_and_resample(audio_data, original_sample_rate, target_sample_rate):
    audio_np = np.frombuffer(audio_data, dtype=np.int16)
    num_original_samples = len(audio_np)
    num_target_samples = int(num_original_samples * target_sample_rate / original_sample_rate)
    resampled_audio = resample(audio_np, num_target_samples)
    return resampled_audio.astype(np.int16).tobytes()

def get_recorder(on_realtime_transcription_stabilized):
    config = {
        'spinner': False,
        'use_microphone': False,
        'model': 'tiny',
        'language': 'en',
        'silero_sensitivity': 0.4,
        'webrtc_sensitivity': 2,
        'post_speech_silence_duration': 0.7,
        'min_length_of_recording': 0,
        'min_gap_between_recordings': 0,
        'enable_realtime_transcription': True,
        'realtime_processing_pause': 0,
        'realtime_model_type': 'tiny.en',
        'on_realtime_transcription_stabilized': on_realtime_transcription_stabilized,
    }
    return AudioToTextRecorder(**config)

@router.websocket("/realtimestt")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    loop = asyncio.get_event_loop()
    full_sentence_queue = asyncio.Queue()

    def on_realtime_text(text):
        # Gửi text realtime về client
        coro = websocket.send_text(json.dumps({'type': 'realtime', 'text': text}))
        asyncio.run_coroutine_threadsafe(coro, loop)

    def recorder_thread_func():
        global recorder
        recorder = get_recorder(on_realtime_text)
        recorder_ready.set()
        while True:
            full_sentence = recorder.text()
            logger.debug(f"Full sentence: {full_sentence}")
            # Đưa full sentence vào queue để gửi về client
            loop.call_soon_threadsafe(full_sentence_queue.put_nowait, full_sentence)

    # Khởi động thread cho recorder
    thread = threading.Thread(target=recorder_thread_func, daemon=True)
    thread.start()
    recorder_ready.wait()

    try:
        while True:
            message = await websocket.receive_bytes()
            logger.debug(f"Received message of length {len(message)} bytes")
            if not recorder_ready.is_set():
                continue
            metadata_length = int.from_bytes(message[:4], byteorder='little')
            metadata_json = message[4:4+metadata_length].decode('utf-8')
            metadata = json.loads(metadata_json)
            sample_rate = metadata['sampleRate']
            chunk = message[4+metadata_length:]
            resampled_chunk = decode_and_resample(chunk, sample_rate, 16000)
            recorder.feed_audio(resampled_chunk)

            # Gửi full sentence nếu có
            while not full_sentence_queue.empty():
                full_sentence = await full_sentence_queue.get()
                await websocket.send_text(json.dumps({'type': 'fullSentence', 'text': full_sentence}))

    except WebSocketDisconnect:
        pass
