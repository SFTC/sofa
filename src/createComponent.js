/**
 * 生成Component
 * 
 * step1. 与用户交互获取ComponentName;
 * step2. 在config中读取ProjectName;
 * step3. 以ComponentName+ProjectName在JsonStore中做重复性检测；
 * step4. 以ComponentName进行查询，若存在，提示用户在某项目中已存在此组件，是否继续；
 * step5. 在config中读取componentTemplatePath;
 * step6. 拷贝文件，获取用户git信息，嵌入注释；
 * step7. 替换关键词ComponentName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
 * step8. 在Jsonstore中记录组件，ProjectName&ComponentName;
 * step9. 在Jsonstore中记录操作日志
 */