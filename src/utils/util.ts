
/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @return 返回拷贝后的对象
 */
export const deepClone = (obj: any) => {
  if (obj === null) return null
  const clone = { ...obj }
  Object.keys(clone).forEach((key) => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]))
  return Array.isArray(obj) && obj.length
    ? (clone.length = obj.length) && Array.from(clone)
    : Array.isArray(obj)
      ? Array.from(obj)
      : clone
}

// 复制文本
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // 让文本框不可见
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  document.body.appendChild(textArea);
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'success' : 'fail';
    console.log('复制文本操作：' + msg);
  } catch (err) {
    console.error('复制失败', err);
  }

  document.body.removeChild(textArea);
}

export function copyTextToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () {
      console.log('文本已成功复制到剪切板');
    }).catch(function (err) {
      console.error('复制失败：', err);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

// 判断是否有滚动条
export function hasScrollbar(el: HTMLElement) {
  if (!el) return false
  return document.documentElement.scrollHeight > window.innerHeight
}