// 数值精确小数点(精确位数，数值)
export function handleNumber(precise: number, num: number) {
  //精确位数转换
  let preciseNum = Math.pow(10, precise)

  //处理数字（精确到小数点后两位）
  let handleNum = Number((Math.abs(num) * preciseNum).toPrecision(15))

  return (Math.round(handleNum) / preciseNum) * Math.sign(num)
}

// 文件大小转换
export function handleFilesize(size: number) {
  if (size < Math.pow(1024, 2)) {
    return handleNumber(2, size / 1024) + "KB"
  } else {
    return handleNumber(2, size / 1024 / 1024) + "MB"
  }
}

//日期格式化 移除 时间部分
export function dateFormat(data: string) {
  if (data) return data.split(" ")[0]
  else return data
}

//下载 文件
export function downloadB(blob: Blob, name: string) {
  const link = document.createElement("a") //创建一个a标签
  const url = window.URL.createObjectURL(blob) //将blob文件对象通过URL.createObjectURL()方法转为为url
  link.href = url //为a标签设置href属性，并赋值为url
  link.download = name //定义下载的文件名，文件名要包含后缀哟！如'导出EXCEL.xlsx'
  document.body.appendChild(link) //把a标签放在body上
  link.click() //出发a标签点击下载
  document.body.removeChild(link) //在body中移除这个a标签
  window.URL.revokeObjectURL(url) //释放blob对象
}
