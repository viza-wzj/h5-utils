import { useEffect, useRef, useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import type { EventHandler } from '@i17hush/h5-utils';
import { emitEvent, offEvent, onEvent, onceEvent } from '@i17hush/h5-utils';
import './common.scss';

function parsePayload(payloadText: string): any {
  try {
    return JSON.parse(payloadText);
  } catch {
    return payloadText;
  }
}

export default function EventTab({
  onResult,
  result,
}: {
  onResult: (msg: string) => void;
  result: string;
}) {
  const [eventName, setEventName] = useState('demo:event');
  const [payloadText, setPayloadText] = useState('{"source":"taro-app","count":1}');
  const handlerRef = useRef<EventHandler | null>(null);

  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        offEvent(eventName, handlerRef.current);
      }
    };
  }, [eventName]);

  return (
    <View className="section">
      <View className="card">
        <Text className="title">跨端自定义事件</Text>
        <View className="row">
          <Text className="label">事件名</Text>
          <Input
            value={eventName}
            onInput={(e) => setEventName(e.detail.value)}
            className="input"
          />
        </View>
        <Textarea
          value={payloadText}
          onInput={(e) => setPayloadText(e.detail.value)}
          className="textarea"
        />
        <View className="btn-row">
          <Button
            onClick={() => {
              if (handlerRef.current) {
                offEvent(eventName, handlerRef.current);
              }
              const handler: EventHandler = (...args) => {
                onResult(`onEvent 收到:\n${JSON.stringify(args.length <= 1 ? args[0] : args, null, 2)}`);
              };
              handlerRef.current = handler;
              onEvent(eventName, handler);
              onResult(`已订阅 ${eventName}`);
            }}
          >
            订阅
          </Button>
          <Button
            onClick={() => {
              const payload = parsePayload(payloadText);
              emitEvent(eventName, payload);
              onResult(`已触发 ${eventName}\n${JSON.stringify(payload, null, 2)}`);
            }}
          >
            触发
          </Button>
          <Button
            onClick={() => {
              const payload = parsePayload(payloadText);
              onceEvent(eventName, (...args) => {
                onResult(
                  `onceEvent 收到:\n${JSON.stringify(args.length <= 1 ? args[0] : args, null, 2)}`,
                );
              });
              emitEvent(eventName, payload);
              emitEvent(eventName, payload);
            }}
          >
            触发一次
          </Button>
          <Button
            onClick={() => {
              if (handlerRef.current) {
                offEvent(eventName, handlerRef.current);
                handlerRef.current = null;
              }
              onResult(`已取消订阅 ${eventName}`);
            }}
          >
            取消订阅
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
