import React from "react";
import { render, screen } from '@testing-library/react';
import App from './App';

//smoke test
test('renders without crashing', () => {
    render(<App />);
});

//smoke test
test("render matches snapshot", () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
});