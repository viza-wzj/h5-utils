import { View, Text, Button } from '@tarojs/components';
import { isIOS, isAndroid, isMobile, isWeChat, getOS, getDeviceInfo } from '@i17hush/h5-utils';
import './common.scss';

export default function DeviceTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  return (
    <View className="section">
      <View className="card">
        <Text className="title">设备检测</Text>
        <Button
          onClick={() => {
            const info = getDeviceInfo();
            onResult(
              [
                `isIOS: ${isIOS()}`,
                `isAndroid: ${isAndroid()}`,
                `isMobile: ${isMobile()}`,
                `isWeChat: ${isWeChat()}`,
                `getOS: ${getOS()}`,
                JSON.stringify(info, null, 2),
              ].join('\n'),
            );
          }}
        >
          检测
        </Button>
      </View>
      {result && (
        <View className="result">
          <Text>{result}</Text>
        </View>
      )}
    </View>
  );
}
