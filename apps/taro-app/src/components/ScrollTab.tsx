import { View, Text, Button } from '@tarojs/components';
import { scrollToTop, lockScroll, unlockScroll } from '@i17hush/h5-utils';
import './common.scss';

export default function ScrollTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  return (
    <View className="section">
      <View className="card">
        <Text className="title">滚动控制</Text>
        <View className="btn-row">
          <Button
            onClick={() => {
              scrollToTop(true);
              onResult('滚动到顶部');
            }}
          >
            回到顶部
          </Button>
          <Button
            onClick={() => {
              lockScroll();
              onResult('已锁定滚动');
            }}
          >
            锁定
          </Button>
          <Button
            onClick={() => {
              unlockScroll();
              onResult('已解锁滚动');
            }}
          >
            解锁
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
