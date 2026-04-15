import { View, Text, Button } from '@tarojs/components';
import { navigateTo, navigateBack } from '@i17hush/h5-utils';
import './common.scss';

export default function RouterTab({
  onResult: _onResult,
  result,
}: {
  onResult: (msg: string) => void;
  result: string;
}) {
  return (
    <View className="section">
      <View className="card">
        <Text className="title">路由跳转</Text>
        <View className="btn-row">
          <Button onClick={() => navigateTo('/pages/index/index?from=navigateTo&foo=bar')}>navigateTo</Button>
          <Button onClick={() => navigateBack()}>navigateBack</Button>
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
