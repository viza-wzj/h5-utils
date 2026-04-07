import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { isMobilePhone, isEmail, isIdCard, isUrl, isChinese } from '@i17hush/h5-utils';
import './common.scss';

export default function ValidatorTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [valInput, setValInput] = useState('13812345678');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">校验器</Text>
        <Input value={valInput} onInput={(e) => setValInput(e.detail.value)} className="input" />
        <View className="btn-row">
          <Button onClick={() => onResult(`手机号: ${isMobilePhone(valInput)}`)}>手机号</Button>
          <Button onClick={() => onResult(`邮箱: ${isEmail(valInput)}`)}>邮箱</Button>
          <Button onClick={() => onResult(`身份证: ${isIdCard(valInput)}`)}>身份证</Button>
          <Button onClick={() => onResult(`URL: ${isUrl(valInput)}`)}>URL</Button>
          <Button onClick={() => onResult(`中文: ${isChinese(valInput)}`)}>中文</Button>
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
