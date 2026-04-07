import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { setStorage, getStorage, removeStorage } from '@i17hush/h5-utils';
import './common.scss';

export default function StorageTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [sKey, setSKey] = useState('test-key');
  const [sVal, setSVal] = useState('hello');
  const [sExpire, setSExpire] = useState('');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">Storage 读写</Text>
        <View className="row">
          <Text className="label">Key</Text>
          <Input value={sKey} onInput={(e) => setSKey(e.detail.value)} className="input" />
        </View>
        <View className="row">
          <Text className="label">Value</Text>
          <Input value={sVal} onInput={(e) => setSVal(e.detail.value)} className="input" />
        </View>
        <View className="row">
          <Text className="label">过期ms</Text>
          <Input
            value={sExpire}
            onInput={(e) => setSExpire(e.detail.value)}
            className="input short"
            placeholder="可选"
          />
        </View>
        <View className="btn-row">
          <Button
            onClick={() => {
              setStorage(sKey, sVal, sExpire ? { expires: +sExpire } : undefined);
              onResult(`已写入 ${sKey}`);
            }}
          >
            写入
          </Button>
          <Button onClick={() => onResult(`${sKey} = ${JSON.stringify(getStorage(sKey))}`)}>读取</Button>
          <Button
            onClick={() => {
              removeStorage(sKey);
              onResult(`已删除 ${sKey}`);
            }}
          >
            删除
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
