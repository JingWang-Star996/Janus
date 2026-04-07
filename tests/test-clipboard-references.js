/**
 * 测试：粘贴引用展开
 */

const { Clipboard } = require('../src/clipboard');
const assert = require('assert');

async function testClipboardReferences() {
  console.log('🧪 测试粘贴引用展开\n');
  
  const clipboard = new Clipboard();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 存储内容并获取引用
    console.log('测试 1: 存储内容并获取引用');
    const { id, reference, type } = await clipboard.storeWithReference({
      content: '这是测试粘贴内容',
      type: 'text',
      title: '测试引用'
    });
    assert(id.startsWith('clip_'), '内容 ID 格式错误');
    assert(reference.includes('[Pasted text #'), '引用格式错误');
    assert(type === 'clipboard', '类型应为 clipboard');
    console.log(`  ✅ 通过 - 引用格式：${reference}\n`);
    passed++;

    // 测试 2: 图片引用格式
    console.log('测试 2: 图片引用格式');
    const imageRef = await clipboard.storeWithReference({
      content: '图片数据...',
      type: 'image',
      title: '测试图片'
    });
    assert(imageRef.reference.includes('[Image #'), '图片引用格式错误');
    console.log(`  ✅ 通过 - 图片引用：${imageRef.reference}\n`);
    passed++;

    // 测试 3: 代码引用格式
    console.log('测试 3: 代码引用格式');
    const codeRef = await clipboard.storeWithReference({
      content: 'console.log("hello")',
      type: 'code',
      title: '测试代码'
    });
    assert(codeRef.reference.includes('[Code #'), '代码引用格式错误');
    console.log(`  ✅ 通过 - 代码引用：${codeRef.reference}\n`);
    passed++;

    // 测试 4: 展开单个引用
    console.log('测试 4: 展开单个引用');
    const contentWithRef = `这是一段文字，引用了 ${reference}，然后继续。`;
    const expanded = await clipboard.expandReferences(contentWithRef);
    assert(expanded.includes('这是测试粘贴内容'), '应展开引用内容');
    assert(expanded.includes('Pasted text #1 开始'), '应有开始标记');
    assert(expanded.includes('Pasted text #1 结束'), '应有结束标记');
    console.log(`  ✅ 通过 - 引用展开成功\n`);
    passed++;

    // 测试 5: 懒加载展开
    console.log('测试 5: 懒加载展开');
    const lazyExpanded = await clipboard.expandReferences(contentWithRef, true);
    assert(lazyExpanded.includes('测试引用'), '应包含标题预览');
    assert(!lazyExpanded.includes('这是测试粘贴内容'), '懒加载不应包含完整内容');
    console.log(`  ✅ 通过 - 懒加载展开成功\n`);
    passed++;

    // 测试 6: 多个引用展开
    console.log('测试 6: 多个引用展开');
    const multiRefContent = `
      第一个引用：${reference}
      第二个引用：${imageRef.reference}
      第三个引用：${codeRef.reference}
    `;
    const multiExpanded = await clipboard.expandReferences(multiRefContent);
    assert(multiExpanded.includes('这是测试粘贴内容'), '应展开第一个引用');
    assert(multiExpanded.includes('图片数据...'), '应展开第二个引用');
    assert(multiExpanded.includes('console.log'), '应展开第三个引用');
    console.log(`  ✅ 通过 - 多个引用展开成功\n`);
    passed++;

    // 测试 7: 引用计数
    console.log('测试 7: 引用计数');
    const refCount = clipboard.getReferenceCount(id);
    assert(refCount >= 1, '引用计数应至少为 1');
    console.log(`  ✅ 通过 - 引用计数：${refCount}\n`);
    passed++;

    // 测试 8: 压缩内容到引用
    console.log('测试 8: 压缩内容到引用');
    const longContent = '第一段内容\n\n'.repeat(50) + '第二段内容\n\n'.repeat(50);
    const { compressed, references } = await clipboard.compressToReferences(longContent, 100);
    assert(references.length > 0, '应有引用');
    assert(compressed.length < longContent.length, '压缩后应更短');
    console.log(`  ✅ 通过 - 压缩到 ${references.length} 个引用，原始 ${longContent.length} → 压缩后 ${compressed.length}\n`);
    passed++;

    // 测试 9: 批量展开引用
    console.log('测试 9: 批量展开引用');
    const contents = [
      `内容 1：${reference}`,
      `内容 2：${imageRef.reference}`,
      `内容 3：${codeRef.reference}`
    ];
    const expandedBatch = await clipboard.batchExpandReferences(contents);
    assert(expandedBatch.length === 3, '应返回 3 个展开结果');
    assert(expandedBatch[0].includes('这是测试粘贴内容'), '第一个应正确展开');
    console.log(`  ✅ 通过 - 批量展开 ${expandedBatch.length} 个内容\n`);
    passed++;

    // 测试 10: 重置引用计数器
    console.log('测试 10: 重置引用计数器');
    clipboard.resetReferenceCounter();
    const newRef = await clipboard.storeWithReference({
      content: '新内容',
      type: 'text'
    });
    assert(newRef.reference.includes('#1'), '计数器重置后应从 1 开始');
    console.log(`  ✅ 通过 - 引用计数器已重置\n`);
    passed++;

  } catch (error) {
    console.log(`  ❌ 失败 - ${error.message}\n`);
    failed++;
  }

  console.log(`\n📊 测试结果：${passed}通过，${failed}失败\n`);
  return { passed, failed };
}

// 运行测试
if (require.main === module) {
  testClipboardReferences().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testClipboardReferences };
