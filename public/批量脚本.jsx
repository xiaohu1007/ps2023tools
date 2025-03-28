// 设置文件路径
var templatePath = app.activeDocument.path + "/模板.psd"; // 模板文件路径
var csvPath = app.activeDocument.path + "/tableData.csv"; // CSV 文件路径
var outputPath = app.activeDocument.path + "/img_output"; // 输出目录
var imgPath = app.activeDocument.path + "/img/"; // 图片目录

// 检查并删除已有的输出目录
var outputFolder = new Folder(outputPath);
if (outputFolder.exists) {
  deleteFolder(outputFolder);
}

// 创建新的输出目录
outputFolder.create();

// 读取 CSV 文件
var csvContent = readCSV(csvPath);


// 解析表头（第一行）及数据行（后续行）
// 假设 CSV 文件的每一行使用制表符分隔，每个单元格内的数据以逗号分隔
var headers = csvContent[0][0].split(','); // 表头数组

// 遍历 CSV 数据，生成每个工牌
for (var i = 0; i < csvContent.length; i++) {
  var row = csvContent[i];
  // 跳过标题行
  if (i === 0) continue;

  // 获取当前行数据
  var newRow = row[0].split(',');

  // 打开模板文件
  var templateDoc = app.open(File(templatePath));

  var itemName = []
  for (var index = 0; index < newRow.length; index++) {
    var item = newRow[index];
    if (item.toString().indexOf('.jpg') > -1) {
      // 传入表头名称作为目标图层名称
      // 替换图片
      replaceImage(templateDoc, headers[index], imgPath + item);
    } else {
      // 替换文字
      itemName.push(item);
      replaceText(templateDoc, headers[index], item);
    }
  }

  // 保存为新的 PSD 文件
  var psdOutputFile = new File(outputPath + "/" + itemName.join('+') + ".psd");
  saveAsPSD(templateDoc, psdOutputFile);

  // 导出为 PNG 文件
  var pngOutputFile = new File(outputPath + "/" + itemName.join('+') + ".png");
  saveAsPNG(templateDoc, pngOutputFile);

  // 关闭模板文件
  templateDoc.close(SaveOptions.DONOTSAVECHANGES);
}

// 读取 CSV 文件函数
function readCSV(path) {
  var file = new File(path);
  var content = [];

  file.open("r");
  while (!file.eof) {
    var line = file.readln();
    content.push(line.split("\t")); // 假设 CSV 使用制表符分隔
  }
  file.close();

  return content;
}

// 递归删除文件夹及其内容函数
function deleteFolder(folder) {
  var files = folder.getFiles();
  for (var i = 0; i < files.length; i++) {
    if (files[i] instanceof Folder) {
      deleteFolder(files[i]);
    } else {
      files[i].remove();
    }
  }
  folder.remove();
}

// 替换文本函数
function replaceText(doc, targetText, newText) {
  var textLayers = doc.artLayers;
  
  for (var i = 0; i < textLayers.length; i++) {
    if (textLayers[i].kind === LayerKind.TEXT) {
      var textLayer = textLayers[i].textItem;
      if (textLayers[i].name === targetText) {
        textLayer.contents = newText;
      }
    }
  }
}

// 替换图片函数
function replaceImage(doc, header ,imgPath) {
  // 构造 File 对象
  var imageFile = new File(imgPath);
  if (!imageFile.exists) {
    alert("图片文件不存在: " + imgPath);
    return;
  }

  // 优先查找名称为“图片”的智能对象图层
  var targetLayer = null;
  for (var i = 0; i < doc.artLayers.length; i++) {
    var layer = doc.artLayers[i];
    if (layer.kind === LayerKind.SMARTOBJECT && layer.name === header) {
      targetLayer = layer;
      break;
    }
  }
  // 如果未找到，则选择第一个智能对象图层
  if (!targetLayer) {
    for (var i = 0; i < doc.artLayers.length; i++) {
      if (doc.artLayers[i].kind === LayerKind.SMARTOBJECT) {
        targetLayer = doc.artLayers[i];
        break;
      }
    }
  }
  if (!targetLayer) {
    alert("未找到可替换的智能对象图层！");
    return;
  }

  // 设置目标图层为当前活动图层
  doc.activeLayer = targetLayer;

  // 利用 ActionDescriptor 调用 “替换内容” 操作
  var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  desc.putPath(idnull, imageFile);
  executeAction(idplacedLayerReplaceContents, desc, DialogModes.NO);
}

// 保存为 PSD 文件函数
function saveAsPSD(doc, file) {
  var psdOptions = new PhotoshopSaveOptions();
  psdOptions.annotations = false;
  psdOptions.layers = true;
  psdOptions.alphaChannels = true;

  doc.saveAs(file, psdOptions, true);
}

// 导出为 PNG 文件函数
function saveAsPNG(doc, file) {
  var exportOptions = new ExportOptionsSaveForWeb();
  exportOptions.format = SaveDocumentType.PNG;
  exportOptions.PNG8 = false;  // 使用 PNG-24
  exportOptions.transparency = true;
  exportOptions.interlaced = false;
  exportOptions.quality = 100;
  
  doc.exportDocument(file, ExportType.SAVEFORWEB, exportOptions);
}
