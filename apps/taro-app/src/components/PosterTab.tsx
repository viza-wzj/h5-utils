import { useState } from 'react';
import { View, Text, Button, Image, Canvas } from '@tarojs/components';
import { drawPoster } from '@i17hush/h5-utils';
import './common.scss';

export default function PosterTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [posterImg, setPosterImg] = useState('');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">drawPoster 海报绘制</Text>
        <Button
          onClick={async () => {
            onResult('生成中...');
            try {
              const url = await drawPoster({
                canvasId: 'poster-canvas',
                imageProxy: process.env.TARO_ENV === 'h5' ? '/cors-proxy?url={url}' : undefined,
                width: 375,
                height: 660,
                backgroundColor: '#667eea',
                elements: [
                  {
                    type: 'rect',
                    x: 0, y: 0, width: 375, height: 200,
                    gradient: { type: 'linear', colors: ['#667eea', '#764ba2'], direction: [0, 0, 375, 200] },
                  },
                  {
                    type: 'image',
                    width: 50, height: 50,
                    src: 'https://i1.hdslb.com/bfs/face/4e62c398447be3b12421fbb9704267151057e9ac.jpg@120w_120h_1c.avif',
                    x: 50, y: 100,
                  },
                  { type: 'circle', x: 187, y: 120, radius: 25, backgroundColor: '#fff' },
                  {
                    type: 'text', x: 188, y: 200, text: 'h5-utils',
                    fontSize: 24, color: '#333', textAlign: 'center', fontWeight: 'bold',
                  },
                  {
                    type: 'rect', x: 20, y: 250, width: 335, height: 120,
                    backgroundColor: '#fff', borderRadius: 12,
                    shadow: { color: 'rgba(0,0,0,0.08)', blur: 16, offsetY: 4 },
                  },
                  {
                    type: 'text', x: 36, y: 20,
                    text: 'Canvas海报绘制，支持圆角、渐变、阴影、多行文字自动换行等功能',
                    fontSize: 14, color: '#666', maxWidth: 305, lineHeight: 24, maxLines: 3,
                  },
                  { type: 'line', x1: 36, y1: 400, x2: 339, y2: 400, color: '#eee', width: 1 },
                  {
                    type: 'qrcode', x: 130, y: 430,
                    text: 'https://github.com/i17hush/h5-utils', size: 120, color: '#333',
                  },
                  {
                    type: 'text', x: 188, y: 560, text: '扫码了解更多',
                    fontSize: 12, color: '#999', textAlign: 'center',
                  },
                ],
              });
              if (url) {
                setPosterImg(url);
                onResult('生成成功');
              } else {
                onResult('错误: 请重试');
              }
            } catch (e: any) {
              onResult('错误: ' + (e.message || e));
            }
          }}
        >
          生成海报
        </Button>
        {posterImg && <Image src={posterImg} mode="widthFix" className="poster-img" />}
        <Canvas
          canvasId="poster-canvas"
          style={{ position: 'fixed', left: '-9999px', width: '375px', height: '660px' }}
        />
      </View>
      {result && (
        <View className="result">
          <Text>{result}</Text>
        </View>
      )}
    </View>
  );
}
