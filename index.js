var http = require('http'),
    gl = require('@gitbeaker/node'),
    createHandler = require('gitlab-webhook-events');

var GITLAB_HOST    = 'https://*****.westeurope.cloudapp.azure.com',
    WEBHOOK_SECRET = '*****',
    API_TOKEN      = '*****',
    BOT_NAME       = 'glbot',
    HTTP_PORT      = 7777

var handler = createHandler({ path: '/glbot', secret: WEBHOOK_SECRET })
var api = new gl.Gitlab({ host: GITLAB_HOST, token: API_TOKEN });

http.createServer((req, res) => {
  handler(req, res, (err) => {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(HTTP_PORT);

handler.on('error', function (err) {
  console.error('ERR:', err.message)
});

handler.on('note', function (event) {
  switch (event.path) {
    case '/glbot':

      var p = event.payload,
          oa = p.object_attributes

      if(p.user.name === BOT_NAME || !p.issue)
        break

      var reply = p.user.name + ' says: "' + oa.note + '"';

      api.IssueNotes.create(
        p.project_id,
        oa.noteable_id,
        reply)
      .then((res) => {console.log(res.body)})
      .catch((e) => {console.error('ERR:', e.description)})

      break

    default:
      console.error('no handler for path:', event.path)
      break
  }
});

//:~
