import { useState } from 'react';
import { View, Text, Input, Textarea, Button, Image, Canvas } from '@tarojs/components';
import {
  parseUrl,
  buildUrl,
  getQueryParam,
  getAllQueryParams,
  setStorage,
  getStorage,
  removeStorage,
  getCookie,
  setCookie,
  removeCookie,
  isIOS,
  isAndroid,
  isMobile,
  isWeChat,
  getOS,
  getDeviceInfo,
  formatDate,
  formatNumber,
  formatPhone,
  formatMoney,
  isMobilePhone,
  isEmail,
  isIdCard,
  isUrl,
  isChinese,
  copyText,
  readText,
  scrollToTop,
  lockScroll,
  unlockScroll,
  drawPoster,
  navigateTo,
  navigateBack,
} from '@i17hush/h5-utils';
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

export default function Index() {
  const [tab, setTab] = useState('poster');
  const [result, setResult] = useState('');

  // 海报
  const [posterImg, setPosterImg] = useState('');

  // URL
  const [urlInput, setUrlInput] = useState('https://example.com/path?name=test&age=18');
  const [buildBase, setBuildBase] = useState('https://example.com/api');
  const [buildParams, setBuildParams] = useState('{"page":1,"size":10}');

  // Storage
  const [sKey, setSKey] = useState('test-key');
  const [sVal, setSVal] = useState('hello');
  const [sExpire, setSExpire] = useState('');

  // Cookie
  const [cName, setCName] = useState('test-cookie');
  const [cVal, setCVal] = useState('cookie-val');

  // Format
  const [fmtDate, setFmtDate] = useState('2026-04-06');
  const [fmtPattern, setFmtPattern] = useState('YYYY-MM-DD HH:mm:ss');
  const [fmtNum, setFmtNum] = useState('1234567.89');
  const [fmtPhone, setFmtPhone] = useState('13812345678');
  const [fmtMoney, setFmtMoney] = useState('12345.67');

  // Validator
  const [valInput, setValInput] = useState('13812345678');

  // Clipboard
  const [clipText, setClipText] = useState('Hello h5-utils!');

  const show = (msg: string) => setResult(msg);

  return (
    <View className="page">
      {/* Tabs */}
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

      {/* 海报 */}
      {tab === 'poster' && (
        <View className="section">
          <View className="card">
            <Text className="title">drawPoster 海报绘制</Text>
            <Button
              onClick={async () => {
                show('生成中...');
                try {
                  const url = await drawPoster({
                    canvasId: 'poster-canvas',
                    imageProxy: process.env.TARO_ENV === 'h5' ? '/cors-proxy?url={url}' : undefined,
                    width: 375,
                    height: 660,
                    backgroundColor: '#667eea',
                    elements: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        width: 375,
                        height: 200,
                        gradient: {
                          type: 'linear',
                          colors: ['#667eea', '#764ba2'],
                          direction: [0, 0, 375, 200],
                        },
                      },
                      {
                        type: 'image',
                        width: 50,
                        height: 50,
                        src: 'https://i1.hdslb.com/bfs/face/4e62c398447be3b12421fbb9704267151057e9ac.jpg@120w_120h_1c.avif',
                        x: 50,
                        y: 100,
                      },
                      {
                        type: 'circle',
                        x: 187,
                        y: 120,
                        radius: 25,
                        backgroundColor: '#fff',
                      },
                      {
                        type: 'text',
                        x: 188,
                        y: 200,
                        text: 'h5-utils',
                        fontSize: 24,
                        color: '#333',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      },
                      {
                        type: 'rect',
                        x: 20,
                        y: 250,
                        width: 335,
                        height: 120,
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        shadow: { color: 'rgba(0,0,0,0.08)', blur: 16, offsetY: 4 },
                      },
                      {
                        type: 'text',
                        x: 36,
                        y: 20,
                        text: 'Canvas海报绘制，支持圆角、渐变、阴影、多行文字自动换行等功能',
                        fontSize: 14,
                        color: '#666',
                        maxWidth: 305,
                        lineHeight: 24,
                        maxLines: 3,
                      },
                      { type: 'line', x1: 36, y1: 400, x2: 339, y2: 400, color: '#eee', width: 1 },
                      {
                        type: 'qrcode',
                        x: 130,
                        y: 430,
                        text: 'https://github.com/i17hush/h5-utils',
                        size: 120,
                        color: '#333',
                      },
                      {
                        type: 'text',
                        x: 188,
                        y: 560,
                        text: '扫码了解更多',
                        fontSize: 12,
                        color: '#999',
                        textAlign: 'center',
                      },
                    ],
                  });
                  if (url) {
                    setPosterImg(url);
                    show('生成成功');
                  } else {
                    show('错误: 请重试');
                  }
                  console.log(url, 'url');
                } catch (e: any) {
                  show('错误: ' + (e.message || e));
                }
              }}
            >
              生成海报
            </Button>
            {posterImg && <Image src={posterImg} mode="widthFix" className="poster-img" />}
            <Canvas
              canvasId="poster-canvas"
              style={{ position: 'fixed', left: '-9999px', width: '375px', height: '660px' }}
            />
          </View>
          {result && (
            <View className="result">
              <Text>{result}</Text>
            </View>
          )}
        </View>
      )}

      {/* URL */}
      {tab === 'url' && (
        <View className="section">
          <View className="card">
            <Text className="title">parseUrl 解析URL</Text>
            <Input
              value={urlInput}
              onInput={(e) => setUrlInput(e.detail.value)}
              className="input"
            />
            <Button onClick={() => show(JSON.stringify(parseUrl(urlInput), null, 2))}>解析</Button>
          </View>
          <View className="card">
            <Text className="title">buildUrl 拼接URL</Text>
            <Input
              value={buildBase}
              onInput={(e) => setBuildBase(e.detail.value)}
              className="input"
            />
            <Textarea
              value={buildParams}
              onInput={(e) => setBuildParams(e.detail.value)}
              className="textarea"
            />
            <Button
              onClick={() => {
                try {
                  show(buildUrl(buildBase, JSON.parse(buildParams)));
                } catch (e: any) {
                  show('JSON格式错误');
                }
              }}
            >
              拼接
            </Button>
          </View>
          <View className="card">
            <Text className="title">当前页面参数</Text>
            <Button
              onClick={() =>
                show(
                  `所有参数: ${JSON.stringify(getAllQueryParams())}\nname: ${getQueryParam(
                    'name',
                  )}`,
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
      )}

      {/* Storage */}
      {tab === 'storage' && (
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
                  show(`已写入 ${sKey}`);
                }}
              >
                写入
              </Button>
              <Button onClick={() => show(`${sKey} = ${JSON.stringify(getStorage(sKey))}`)}>
                读取
              </Button>
              <Button
                onClick={() => {
                  removeStorage(sKey);
                  show(`已删除 ${sKey}`);
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
      )}

      {/* Cookie */}
      {tab === 'cookie' && (
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
                  show(`已写入 ${cName}`);
                }}
              >
                写入
              </Button>
              <Button onClick={() => show(`${cName} = ${getCookie(cName)}`)}>读取</Button>
              <Button
                onClick={() => {
                  removeCookie(cName);
                  show(`已删除 ${cName}`);
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
      )}

      {/* 设备 */}
      {tab === 'device' && (
        <View className="section">
          <View className="card">
            <Text className="title">设备检测</Text>
            <Button
              onClick={() => {
                const info = getDeviceInfo();
                show(
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
      )}

      {/* 格式化 */}
      {tab === 'format' && (
        <View className="section">
          <View className="card">
            <Text className="title">formatDate</Text>
            <View className="row">
              <Input
                value={fmtDate}
                onInput={(e) => setFmtDate(e.detail.value)}
                className="input"
              />
              <Input
                value={fmtPattern}
                onInput={(e) => setFmtPattern(e.detail.value)}
                className="input"
              />
            </View>
            <Button onClick={() => show(formatDate(new Date(fmtDate), fmtPattern))}>格式化</Button>
          </View>
          <View className="card">
            <Text className="title">formatNumber 千分位</Text>
            <Input value={fmtNum} onInput={(e) => setFmtNum(e.detail.value)} className="input" />
            <Button onClick={() => show(formatNumber(+fmtNum))}>格式化</Button>
          </View>
          <View className="card">
            <Text className="title">formatPhone</Text>
            <Input
              value={fmtPhone}
              onInput={(e) => setFmtPhone(e.detail.value)}
              className="input"
            />
            <Button onClick={() => show(formatPhone(fmtPhone))}>格式化</Button>
          </View>
          <View className="card">
            <Text className="title">formatMoney</Text>
            <Input
              value={fmtMoney}
              onInput={(e) => setFmtMoney(e.detail.value)}
              className="input"
            />
            <Button onClick={() => show(formatMoney(+fmtMoney))}>格式化</Button>
          </View>
          {result && (
            <View className="result">
              <Text>{result}</Text>
            </View>
          )}
        </View>
      )}

      {/* 校验器 */}
      {tab === 'validator' && (
        <View className="section">
          <View className="card">
            <Text className="title">校验器</Text>
            <Input
              value={valInput}
              onInput={(e) => setValInput(e.detail.value)}
              className="input"
            />
            <View className="btn-row">
              <Button onClick={() => show(`手机号: ${isMobilePhone(valInput)}`)}>手机号</Button>
              <Button onClick={() => show(`邮箱: ${isEmail(valInput)}`)}>邮箱</Button>
              <Button onClick={() => show(`身份证: ${isIdCard(valInput)}`)}>身份证</Button>
              <Button onClick={() => show(`URL: ${isUrl(valInput)}`)}>URL</Button>
              <Button onClick={() => show(`中文: ${isChinese(valInput)}`)}>中文</Button>
            </View>
          </View>
          {result && (
            <View className="result">
              <Text>{result}</Text>
            </View>
          )}
        </View>
      )}

      {/* 剪贴板 */}
      {tab === 'clipboard' && (
        <View className="section">
          <View className="card">
            <Text className="title">剪贴板</Text>
            <Input
              value={clipText}
              onInput={(e) => setClipText(e.detail.value)}
              className="input"
            />
            <View className="btn-row">
              <Button
                onClick={async () => {
                  await copyText(clipText);
                  show('已复制!');
                }}
              >
                复制
              </Button>
              <Button
                onClick={async () => {
                  const t = await readText();
                  show(`内容: ${t}`);
                }}
              >
                读取
              </Button>
            </View>
          </View>
          {result && (
            <View className="result">
              <Text>{result}</Text>
            </View>
          )}
        </View>
      )}

      {/* 滚动 */}
      {tab === 'scroll' && (
        <View className="section">
          <View className="card">
            <Text className="title">滚动控制</Text>
            <View className="btn-row">
              <Button
                onClick={() => {
                  scrollToTop(true);
                  show('滚动到顶部');
                }}
              >
                回到顶部
              </Button>
              <Button
                onClick={() => {
                  lockScroll();
                  show('已锁定滚动');
                }}
              >
                锁定
              </Button>
              <Button
                onClick={() => {
                  unlockScroll();
                  show('已解锁滚动');
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
      )}

      {/* 路由 */}
      {tab === 'router' && (
        <View className="section">
          <View className="card">
            <Text className="title">路由跳转</Text>
            <View className="btn-row">
              <Button onClick={() => navigateTo('/pages/index/index?from=navigateTo&foo=bar')}>
                navigateTo
              </Button>
              <Button onClick={() => navigateBack()}>navigateBack</Button>
            </View>
          </View>
          {result && (
            <View className="result">
              <Text>{result}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
