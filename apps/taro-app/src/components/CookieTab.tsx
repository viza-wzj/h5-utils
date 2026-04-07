import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { setCookie, getCookie, removeCookie } from '@i17hush/h5-utils';
import './common.scss';

export default function CookieTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [cName, setCName] = useState('test-cookie');
  const [cVal, setCVal] = useState('cookie-val');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">Cookie 读写</Text>
        <View className="row">
          <Text className="label">Name</Text>
          <Input value={cName} onInput={(e) => setCName(e.detail.value)} className="input" />
        </View>
        <View className="row">
          <Text className="label">Value</Text>
          <Input value={cVal} onInput={(e) => setCVal(e.detail.value)} className="input" />
        </View>
        <View className="btn-row">
          <Button
            onClick={() => {
              setCookie(cName, cVal);
              onResult(`已写入 ${cName}`);
            }}
          >
            写入
          </Button>
          <Button onClick={() => onResult(`${cName} = ${getCookie(cName)}`)}>读取</Button>
          <Button
            onClick={() => {
              removeCookie(cName);
              onResult(`已删除 ${cName}`);
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
