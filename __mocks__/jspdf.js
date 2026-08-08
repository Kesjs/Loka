module.exports = {
  jsPDF: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    setTextColor: jest.fn().mockReturnThis(),
    autoTable: jest.fn().mockReturnThis(),
    lastAutoTable: { finalY: 100 },
    output: jest.fn().mockReturnValue(new ArrayBuffer(100)),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  })),
}
