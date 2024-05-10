# st-auth-server

### Стек технологий
<div>
    <img
    style="height: 45px;"
    src="https://cdn-icons-png.flaticon.com/512/5968/5968381.png"
    alt="TypeScript"
    />
    <img
    style="height: 45px;"
    src="https://seeklogo.com/images/F/fastify-logo-4FA5E177B6-seeklogo.com.png"
    alt="Fastify.js"
    />
    <img
    style="height: 45px;"
    src="https://miro.medium.com/v2/resize:fit:512/1*doAg1_fMQKWFoub-6gwUiQ.png"
    alt="MongoDB"
    />
</div>

###
> Проект провальный. Рабочий, но очень плохо написанный. <strong>Идёт работа над над ST v.1.2</strong>

### Информация
**st-auth-server** - один из модулей системы SmartTesting. Он отвечает за хранение основных данных о пользователях системы и за их авторизацию, а также авторизацию подключенных устройств (клиентов [st-exam-client](https://github.com/rakhmight/st-exam-client)).

### Сборка и запуск
- в .env указать переменные:
```js
SERVER_PORT // порт сервера
DB_USER, DB_PASSWORD, DB_NAME // имя БД в MongoDB, пользователь и его пароль
ST_ADMIN_SERVER_IP // полный адрес st-admin-server (протокол:/ip-адрес:порт или домен)
```
> После запуска в БД появятся коллекции users:
> - users - общие данные пользовательй
> - employees, enrollees, students, teachers - данные связанные с ролью пользователей
> - devices - подключённые клиенты

- устанавливаем зависимости:
```bash
npm i
```

- компилириуем код:
```bash
npm run build
```

- После компиляции кода в build сборке создаём 2 папки:
    - storage - внутри неё папки users (здесь будет храниться json файл с полными данными пользователей) и avatars (тут будут храниться фотографии пользователей)
    - logs - тут будут храниться логи сервера

- запускаем сервер:
```bash
npm run start
```