import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const SignatureComponent = ({ initialSignature, onSave }) => {
  const [signatureType, setSignatureType] = useState(initialSignature ? 'eSignature' : 'manualSignature');
  const [signatureName, setSignatureName] = useState(initialSignature?.signatureName || '');
  const [showPad, setShowPad] = useState(false);
  const signaturePadRef = useRef(null);

  const handleSave = () => {
    if (signatureType === 'eSignature' && signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      onSave({ type: 'eSignature', name: signatureName, data: signatureData });
    } else if (signatureType === 'manualSignature') {
      onSave({ type: 'manualSignature', name: signatureName, data: null });
    }
    setShowPad(false);
  };

  return (
    <>
      <Button onClick={() => setShowPad(true)}>
        {initialSignature ? 'Edit Signature' : 'Add Signature'}
      </Button>
      <Dialog open={showPad} onClose={() => setShowPad(false)}>
        <DialogTitle>Signature</DialogTitle>
        <DialogContent>
          <TextField
            label="Signature Name"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            fullWidth
            margin="normal"
          />
          {signatureType === 'eSignature' && (
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{ width: 500, height: 200 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPad(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SignatureComponent;
