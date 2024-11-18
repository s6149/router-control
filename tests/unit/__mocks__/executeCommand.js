const mockExecuteCommand = jest.fn().mockImplementation((command) => {
    return Promise.resolve({
        success: true,
        output: 'mock output',
        error: ''
    });
});

module.exports = mockExecuteCommand;