import React from 'react';

interface TextAreaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
    value,
    onChange,
    placeholder,
    className = '',
    readOnly = false,
}) => {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`input-field resize-none ${className}`}
            rows={6}
        />
    );
};

export default TextArea;
