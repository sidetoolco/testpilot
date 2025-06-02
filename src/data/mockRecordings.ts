import { Recording } from '../types';

export const mockRecordings: Recording[] = [
  {
    id: '1',
    duration: '12:16',
    tester: {
      name: 'David R.',
      age: '38',
      initials: 'DR',
      color: 'bg-orange-200',
    },
    date: 'Nov 21, 2024',
  },
  {
    id: '2',
    duration: '10:45',
    tester: {
      name: 'Jeff G.',
      age: '42',
      initials: 'JG',
      color: 'bg-blue-200',
    },
    date: 'Nov 20, 2024',
  },
  {
    id: '3',
    duration: '14:22',
    tester: {
      name: 'Mike K.',
      age: '35',
      initials: 'MK',
      color: 'bg-green-200',
    },
    date: 'Nov 20, 2024',
  },
];
