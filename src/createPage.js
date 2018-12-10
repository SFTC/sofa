/**
 * 生成Page
 * 
 * step1. 与用户交互获取PageName；
 * step2. 借助sofaConfig获取pageTemplatePath;
 * step3. 列出所有可用模板，与用户交互选择模板；
 * step4. 与用户交互是否存在父级；
 * step5. 拷贝文件，获取用户git信息，嵌入注释；
 * step6. 替换关键词PageName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
 * step7. 处理Menu及国际化相关；
 * step8. 在Jsonstore中记录操作日志
 */