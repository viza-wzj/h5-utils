import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { formatDate, formatNumber, formatPhone, formatMoney } from '@i17hush/h5-utils';
import './common.scss';

export default function FormatTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [fmtDate, setFmtDate] = useState('2026-04-06');
  const [fmtPattern, setFmtPattern] = useState('YYYY-MM-DD HH:mm:ss');
  const [fmtNum, setFmtNum] = useState('1234567.89');
  const [fmtPhone, setFmtPhone] = useState('13812345678');
  const [fmtMoney, setFmtMoney] = useState('12345.67');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">formatDate</Text>
        <View className="row">
          <Input value={fmtDate} onInput={(e) => setFmtDate(e.detail.value)} className="input" />
          <Input value={fmtPattern} onInput={(e) => setFmtPattern(e.detail.value)} className="input" />
        </View>
        <Button onClick={() => onResult(formatDate(new Date(fmtDate), fmtPattern))}>格式化</Button>
      </View>
      <View className="card">
        <Text className="title">formatNumber 千分位</Text>
        <Input value={fmtNum} onInput={(e) => setFmtNum(e.detail.value)} className="input" />
        <Button onClick={() => onResult(formatNumber(+fmtNum))}>格式化</Button>
      </View>
      <View className="card">
        <Text className="title">formatPhone</Text>
        <Input value={fmtPhone} onInput={(e) => setFmtPhone(e.detail.value)} className="input" />
        <Button onClick={() => onResult(formatPhone(fmtPhone))}>格式化</Button>
      </View>
      <View className="card">
        <Text className="title">formatMoney</Text>
        <Input value={fmtMoney} onInput={(e) => setFmtMoney(e.detail.value)} className="input" />
        <Button onClick={() => onResult(formatMoney(+fmtMoney))}>格式化</Button>
      </View>
      {result && (
        <View className="result">
          <Text>{result}</Text>
        </View>
      )}
    </View>
  );
}
