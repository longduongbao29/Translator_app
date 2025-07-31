
import { useRef } from 'react';


export const useAudioWebSocket = (onText: (text: string) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const start = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;

        const ws = new WebSocket('ws://localhost:8003/api/v1/ws/realtimestt');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket opened, start streaming PCM audio');
            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const outputData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    outputData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                if (ws.readyState === WebSocket.OPEN) {
                    // Đóng gói metadata như client.js
                    const metadata = JSON.stringify({ sampleRate: audioContext.sampleRate });
                    const metadataBytes = new TextEncoder().encode(metadata);
                    const metadataLength = new ArrayBuffer(4);
                    const metadataLengthView = new DataView(metadataLength);
                    metadataLengthView.setInt32(0, metadataBytes.byteLength, true);
                    const blob = new Blob([
                        metadataLength,
                        metadataBytes,
                        outputData.buffer
                    ]);
                    ws.send(blob);
                }
            };
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'realtime') {
                    console.log('Realtime text received:', data.text);

                    onText(data.text);
                } else if (data.type === 'fullSentence') {
                    onText(data.text); // hoặc xử lý khác nếu muốn
                    console.log('Full sentence received:', data.text);
                }
            } catch (e) {
                // fallback nếu không phải JSON
                onText(event.data);
            }
        };
        ws.onerror = (e) => { console.error('WebSocket error', e); };
        ws.onclose = () => { console.warn('WebSocket closed'); };
    };


    const stop = () => {
        // Đóng WebSocket trước tiên
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }
        // Dừng processor
        if (processorRef.current) {
            processorRef.current.disconnect();
        }
        // Dừng audioContext
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        // Dừng stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    return { start, stop };
};
