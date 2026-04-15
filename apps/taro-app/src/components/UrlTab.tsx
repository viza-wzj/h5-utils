import { useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import {
  parseUrl,
  buildUrl,
  getQueryParam,
  getAllQueryParams,
  getQueryParamFromUrl,
  getAllQueryParamsFromUrl,
} from '@i17hush/h5-utils';
import './common.scss';

export default function UrlTab({ onResult, result }: { onResult: (msg: string) => void; result: string }) {
  const [urlInput, setUrlInput] = useState('https://example.com/path?name=test&age=18');
  const [buildBase, setBuildBase] = useState('https://example.com/api');
  const [buildParams, setBuildParams] = useState('{"page":1,"size":10}');
  const [queryKey, setQueryKey] = useState('name');

  return (
    <View className="section">
      <View className="card">
        <Text className="title">parseUrl 解析URL</Text>
        <Input value={urlInput} onInput={(e) => setUrlInput(e.detail.value)} className="input" />
        <Button onClick={() => onResult(JSON.stringify(parseUrl(urlInput), null, 2))}>解析</Button>
      </View>
      <View className="card">
        <Text className="title">buildUrl 拼接URL</Text>
        <Input value={buildBase} onInput={(e) => setBuildBase(e.detail.value)} className="input" />
        <Textarea value={buildParams} onInput={(e) => setBuildParams(e.detail.value)} className="textarea" />
        <Button
          onClick={() => {
            try {
              onResult(buildUrl(buildBase, JSON.parse(buildParams)));
            } catch (e: any) {
              onResult('JSON格式错误');
            }
          }}
        >
          拼接
        </Button>
      </View>
      <View className="card">
        <Text className="title">任意 URL 参数</Text>
        <Input value={queryKey} onInput={(e) => setQueryKey(e.detail.value)} className="input" />
        <View className="btn-row">
          <Button
            onClick={() =>
              onResult(
                JSON.stringify(
                  {
                    key: queryKey,
                    value: getQueryParamFromUrl(urlInput, queryKey),
                    all: getAllQueryParamsFromUrl(urlInput),
                  },
                  null,
                  2,
                ),
              )
            }
          >
            提取参数
          </Button>
        </View>
      </View>
      <View className="card">
        <Text className="title">当前页面参数（H5）</Text>
        <Button
          onClick={() =>
            onResult(
              `所有参数: ${JSON.stringify(getAllQueryParams())}\nname: ${getQueryParam('name')}`,
            )
          }
        >
          获取
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
