// 云端同步的白名单 key（服务端与客户端共用）
export const CLOUD_KEYS = [
  'gesp_lv0_prog',
  'gesp_lv1_prog',
  'gesp_lv2_prog',
  'gesp_lv3_prog',
  'gesp_lv4_prog',
  'gesp_lv5_prog',
  'gesp_lv6_prog',
  'gesp_lv7_prog',
  'gesp_lv8_prog',
  'gesp_wrong',
  'gesp_user_profile'
];

export function isCloudKey(key) {
  return CLOUD_KEYS.includes(key);
}
