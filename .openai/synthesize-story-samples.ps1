$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$sproutSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $sproutVoices = @($sproutSynth.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name.StartsWith('en') })
  if (-not $sproutVoices.Count) { throw 'No installed English Windows synthesis voice is available.' }
  $sproutVoice = $sproutVoices | Where-Object { $_.VoiceInfo.Gender -eq 'Female' } | Select-Object -First 1
  if (-not $sproutVoice) { $sproutVoice = $sproutVoices[0] }
  $sproutSynth.SelectVoice($sproutVoice.VoiceInfo.Name)
  $sproutSamples = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'story-voice-samples.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($sproutSample in $sproutSamples) {
    if ($sproutSample.name -notmatch '^[a-z-]+$') { throw 'Invalid sample filename.' }
    $sproutPath = Join-Path $PSScriptRoot ($sproutSample.name + '-story.wav')
    $sproutSynth.SetOutputToWaveFile($sproutPath)
    $sproutEscaped = [System.Security.SecurityElement]::Escape($sproutSample.text)
    $sproutLanguage = $sproutVoice.VoiceInfo.Culture.Name
    $sproutSynth.SpeakSsml("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='$sproutLanguage'><prosody pitch='+25%' rate='medium'>$sproutEscaped</prosody></speak>")
    $sproutSynth.SetOutputToNull()
    Get-Item -LiteralPath $sproutPath | Select-Object Name,Length
  }
  'Voice used: ' + $sproutVoice.VoiceInfo.Name
} finally { $sproutSynth.Dispose() }
