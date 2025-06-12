import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Select, Checkbox, Textarea, HStack, VStack, useDisclosure
} from '@chakra-ui/react';

const LEVELS = ['easy', 'medium', 'hard'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

export interface CustomTestOptions {
  count: number;
  level: string;
  include_numbers: boolean;
  include_punctuation: boolean;
  lang: string;
  customText: string;
}

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opts: CustomTestOptions) => void;
}

const CustomTestModal: React.FC<CustomTestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [count, setCount] = useState(25);
  const [level, setLevel] = useState('easy');
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [lang, setLang] = useState('en');
  const [customText, setCustomText] = useState('');

  const handleSubmit = () => {
    onSubmit({
      count,
      level,
      include_numbers: includeNumbers,
      include_punctuation: includePunctuation,
      lang,
      customText: customText.trim(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Custom Typing Test</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Count</FormLabel>
                <Input type="number" min={1} max={1000} value={count} onChange={e => setCount(Number(e.target.value))} />
              </FormControl>
              <FormControl>
                <FormLabel>Level</FormLabel>
                <Select value={level} onChange={e => setLevel(e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Language</FormLabel>
                <Select value={lang} onChange={e => setLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </Select>
              </FormControl>
            </HStack>
            <HStack spacing={8}>
              <Checkbox isChecked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)}>
                Include Numbers
              </Checkbox>
              <Checkbox isChecked={includePunctuation} onChange={e => setIncludePunctuation(e.target.checked)}>
                Include Punctuation
              </Checkbox>
            </HStack>
            <FormControl>
              <FormLabel>Custom Text (optional)</FormLabel>
              <Textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste or type your own text here. If provided, this will be used instead of generated content."
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Start Test
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomTestModal; 