const express = require('express');
const app = express();
const port = 3000;
const {spawnSync} = require('child_process');
const {readFile, unlink} = require('fs');

app.use(express.json());

app.post('/', (req, res) => {
    console.log('Transcrevendo audio: ', req.body)
    const audio = req.body.audio;
    const transcribeStatus = transcribe(audio);
    if (transcribeStatus !== 0) {
        res.status(500).send('Erro ao transcrever o áudio');
        return
    }
    const transcriptionFile = audio.substring(0, audio.lastIndexOf('.')) + '.json';
    readFile(transcriptionFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        unlink(transcriptionFile, (err) => {
            if (err) {
                console.error(err)
            }
        })
        unlink('audios/' + audio, (err) => {
            if (err) {
                console.error(err)
            }
        })
        res.json(JSON.parse(data.toString()))
    })
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
    return result.status
}