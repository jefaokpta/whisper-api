const express = require('express');
const app = express();
const port = 3000;
const { spawnSync } = require('child_process');


app.get('/', (req, res) => {
    transcribe('desculpa.ogg')
    res.sendStatus(200)
});

app.listen(port, () => {
    console.log(`🚀 App listening at http://localhost:${port}`);
});

function transcribe(audioName) {
    const command = 'venv/bin/whisper '
        + 'audios/'+ audioName + ' ' +
        '--model=large ' +
        '--fp16=False ' +
        '--language=pt ' +
        '--beam_size=5 ' +
        '--patience=2 ' +
        '--output_format=json'
    const result = spawnSync(command, { shell: true });
    console.log(result.status)
}