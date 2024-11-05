document.addEventListener('DOMContentLoaded', function() {
  M.updateTextFields();
});

document.getElementById('startButton').addEventListener('click', async function() {
  const payloadText = document.getElementById('payload').value;
  let payload;

  try {
    payload = JSON.parse(payloadText);
  } catch (e) {
    M.toast({html: 'Payload inválido'});
    return;
  }

  const challenge = Uint8Array.from(atob(payload.data.challenge), c => c.charCodeAt(0));

  const options = {
    publicKey: {
      challenge: challenge,
      rp: payload.data.rp,
      user: {
        id: Uint8Array.from(payload.data.user.id, c => c.charCodeAt(0)),
        name: payload.data.user.name,
        displayName: payload.data.user.displayName
      },
      pubKeyCredParams: payload.data.pubKeyCredParams,
      extensions: payload.data.extensions
    }
  };

  try {
    const credential = await navigator.credentials.create(options);

    const response = {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      response: {
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
        attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject)))
      },
      type: credential.type,
      clientExtensionResults: credential.getClientExtensionResults(),
      authenticatorAttachment: credential.authenticatorAttachment || "unspecified"
    };

    const resultPayload = {
      data: response
    };

    document.getElementById('result').textContent = JSON.stringify(resultPayload, null, 2);
  } catch (err) {
    M.toast({html: 'Erro durante o desafio FIDO2'});
    console.error(err);
  }
});