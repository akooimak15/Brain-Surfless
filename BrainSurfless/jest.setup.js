import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-sensors', () => ({
	accelerometer: {
		subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
	},
	SensorTypes: {
		accelerometer: 'accelerometer',
	},
	setUpdateIntervalForType: jest.fn(),
}));
