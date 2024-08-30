require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const {spawnSync} = require('child_process');
const {unlink, createWriteStream, readFileSync} = require('fs');
const axios = require("axios");


app.use(express.json());

const S3_MEDIA_PATH = process.env.S3_MEDIA_PATH
const LOCAL_AUDIO_PATH = 'audios/';

app.post('/transcribe', async (req, res) => {
    console.log('Transcrevendo audio do S3: ', req.body)
    const audio = req.body.audio;
    const controlNumber = req.body.controlNumber;
    const writer = createWriteStream(LOCAL_AUDIO_PATH + audio);
    const transcriptionFileJs = audio.substring(0, audio.lastIndexOf('.')) + '.json';

    try{
        const response = await axios({
            method: 'GET',
            url: S3_MEDIA_PATH + `/${controlNumber}/${audio}`,
            responseType: 'stream'
        })
        response.data.pipe(writer);
    } catch (e){
        console.error(e, e.message, 'Erro ao baixar arquivo de audio do S3.')
        res.status(500).send('Error downloading the audio file.');
    }


    writer.on('finish', () => {
        res.json(prepareToTranscribe(audio, transcriptionFileJs));
        cleanFileAndMedia(audio, transcriptionFileJs);
    });

    writer.on('error', (err) => {
        console.error(err);
        res.status(500).send('Error saving the audio file.');
    });
});

app.listen(port, () => {
    console.log(`🚀 App listening at http://localhost:${port}`);
});

function prepareToTranscribe(audioName, transcriptionFileJs) {
    const transcribeStatus = transcribe(audioName);
    if (transcribeStatus !== 0) {
        throw new Error('Erro ao transcrever audio.');
    }
    return JSON.parse(readFileSync(transcriptionFileJs, 'utf8'))
}

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

function cleanFileAndMedia(audioName, transcriptionFileJs) {
    unlink(transcriptionFileJs, (err) => {
        if (err) {
            throw new Error('Erro ao deletar arquivo de transcrição.');
        }
    })
    unlink(LOCAL_AUDIO_PATH + audioName, (err) => {
        if (err) {
            throw new Error('Erro ao deletar arquivo de audio.');
        }
    })
}