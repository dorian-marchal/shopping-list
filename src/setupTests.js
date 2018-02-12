import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Makes calls to console.(error|warn) throw in tests.
const { error, warn } = console;

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.warn = (message) => {
    throw new Error(`console.warn: ${message}`);
  };
  // eslint-disable-next-line no-console
  console.error = (message) => {
    throw new Error(`console.error: ${message}`);
  };
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.warn = warn;
  // eslint-disable-next-line no-console
  console.error = error;
});
