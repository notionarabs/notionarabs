'use client';

import React from 'react';

const ArabicHeaderWidget = ({
    text = 'عرب نوشن',
    font = 'tajawal',
    color = '#f5631e',
    fontSize = '48px',
    textAlign = 'center',
    fontWeight = '700',
    theme = 'light' // Not used much here as it's transparent usually
}) => {
    const fontMap = {
        'tajawal': "'Tajawal', sans-serif",
        'cairo': "'Cairo', sans-serif",
        'amiri': "'Amiri', serif",
        'kufi': "'Reem Kufi', sans-serif",
        'ruqaa': "'Aref Ruqaa', serif",
        'vibes': "'Great Vibes', cursive",
        'lemon': "'Lemonada', cursive"
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign === 'right' ? 'flex-end' : textAlign === 'left' ? 'flex-start' : 'center',
        width: '100%',
        height: '100%',
        padding: '20px',
        backgroundColor: 'transparent',
        textAlign: textAlign,
    };

    const textStyle = {
        fontFamily: fontMap[font] || fontMap.tajawal,
        color: color,
        fontSize: fontSize,
        fontWeight: fontWeight,
        margin: 0,
        lineHeight: '1.2',
        direction: 'rtl',
    };

    return (
        <div style={containerStyle}>
            <link
                href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;700&family=Great+Vibes&family=Lemonada:wght@300;700&family=Reem+Kufi:wght@400;700&family=Tajawal:wght@400;700&display=swap"
                rel="stylesheet"
            />
            <h1 style={textStyle}>{text}</h1>
        </div>
    );
};

export default ArabicHeaderWidget;
