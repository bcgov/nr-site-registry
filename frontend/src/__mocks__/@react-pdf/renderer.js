/* eslint-disable react/prop-types */
const React = require('react');

const Document = ({ children }) =>
  React.createElement('div', { 'data-testid': 'pdf-document' }, children);
const Page = ({ children }) =>
  React.createElement('div', { 'data-testid': 'pdf-page' }, children);
const View = ({ children }) => React.createElement('div', null, children);
const Text = ({ children }) => React.createElement('span', null, children);
const Image = () => React.createElement('img', { alt: 'pdf-image' });
const Link = ({ children }) => React.createElement('a', null, children);
const Font = { register: () => {}, getRegisteredFonts: () => [] };
const StyleSheet = { create: (s) => s };
const pdf = () => ({ toBlob: () => Promise.resolve(new Blob()) });
const PDFDownloadLink = ({ children }) =>
  React.createElement(
    'div',
    null,
    typeof children === 'function' ? children({}) : children,
  );

module.exports = {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  Font,
  StyleSheet,
  pdf,
  PDFDownloadLink,
};
