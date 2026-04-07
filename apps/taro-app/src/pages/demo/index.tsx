import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import PosterTab from '../../components/PosterTab';
import UrlTab from '../../components/UrlTab';
import StorageTab from '../../components/StorageTab';
import CookieTab from '../../components/CookieTab';
import DeviceTab from '../../components/DeviceTab';
import FormatTab from '../../components/FormatTab';
import ValidatorTab from '../../components/ValidatorTab';
import ClipboardTab from '../../components/ClipboardTab';
import ScrollTab from '../../components/ScrollTab';
import RouterTab from '../../components/RouterTab';
import './index.scss';

const TABS = [
  { key: 'poster', label: '海报' },
  { key: 'url', label: 'URL' },
  { key: 'storage', label: 'Storage' },
  { key: 'cookie', label: 'Cookie' },
  { key: 'device', label: '设备' },
  { key: 'format', label: '格式化' },
  { key: 'validator', label: '校验' },
  { key: 'clipboard', label: '剪贴板' },
  { key: 'scroll', label: '滚动' },
  { key: 'router', label: '路由' },
];

export default function Demo() {
  const [tab, setTab] = useState('poster');
  const [result, setResult] = useState('');

  const tabProps = { onResult: setResult, result };

  return (
    <View className="page">
      <View className="tabs">
        {TABS.map((t) => (
          <View
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => {
              setTab(t.key);
              setResult('');
            }}
          >
            <Text>{t.label}</Text>
          </View>
        ))}
      </View>

      {tab === 'poster' && <PosterTab {...tabProps} />}
      {tab === 'url' && <UrlTab {...tabProps} />}
      {tab === 'storage' && <StorageTab {...tabProps} />}
      {tab === 'cookie' && <CookieTab {...tabProps} />}
      {tab === 'device' && <DeviceTab {...tabProps} />}
      {tab === 'format' && <FormatTab {...tabProps} />}
      {tab === 'validator' && <ValidatorTab {...tabProps} />}
      {tab === 'clipboard' && <ClipboardTab {...tabProps} />}
      {tab === 'scroll' && <ScrollTab {...tabProps} />}
      {tab === 'router' && <RouterTab {...tabProps} />}
    </View>
  );
}
