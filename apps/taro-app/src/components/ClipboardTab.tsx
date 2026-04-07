import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { copyText, readText } from '@i17hush/h5-utils';
import './common.scss';

export default function ClipboardTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [clipText, setClipText] = useState('Hello h5-utils!');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">剪贴板</Text>
        <Input value={clipText} onInput={(e) => setClipText(e.detail.value)} className="input" />
        <View className="btn-row">
          <Button
            onClick={async () => {
              await copyText(clipText);
              onResult('已复制!');
            }}
          >
            复制
          </Button>
          <Button
            onClick={async () => {
              const t = await readText();
              onResult(`内容: ${t}`);
            }}
          >
            读取
          </Button>
        </View>
      </View>
      {result && (
        <View className="result">
          <Text>{result}</Text>
        </View>
      )}
    </View>
  );
}
