import { act, fireEvent, screen } from '@testing-library/react';

import {
  createAppWithEditor,
  createMockApp,
} from '../../../test-utils/mockApp';
import { renderWithApp } from '../../../test-utils/renderWithApp';
import { EmailGroup } from './EmailGroup';
import * as helpers from './helpers';

jest.mock('./helpers', () => ({
  sendNoteByEmail: jest.fn().mockResolvedValue(undefined),
}));

const mockedSendNoteByEmail = helpers.sendNoteByEmail as jest.MockedFunction<
  typeof helpers.sendNoteByEmail
>;

describe('EmailGroup — email page integration (integration)', () => {
  beforeEach(() => {
    mockedSendNoteByEmail.mockClear();
  });

  it('renders the Email Page button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<EmailGroup />, app);
    expect(screen.getByText('Email Page')).toBeInTheDocument();
  });

  it('renders the Meeting Details button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<EmailGroup />, app);
    expect(screen.getByText('Meeting Details')).toBeInTheDocument();
  });

  it('calls sendNoteByEmail with the editor markdown content and derived title', async () => {
    const { app } = createAppWithEditor('# My Note\nHello world');
    renderWithApp(<EmailGroup />, app);

    await act(async () => {
      fireEvent.click(screen.getByText('Email Page'));
    });

    expect(mockedSendNoteByEmail).toHaveBeenCalledWith(
      '# My Note\nHello world',
      'My Note',
      undefined,
      undefined,
    );
  });

  it('calls sendNoteByEmail with reading-mode HTML when a preview is available', async () => {
    const { app } = createAppWithEditor('# My Note\nHello world');
    const previewEl = document.createElement('div');
    previewEl.innerHTML = '<h1>My Note</h1><p>Hello world</p>';
    (app.workspace as unknown as { activeLeaf: unknown }).activeLeaf = {
      view: { previewMode: { containerEl: previewEl } },
    };
    renderWithApp(<EmailGroup />, app);

    await act(async () => {
      fireEvent.click(screen.getByText('Email Page'));
    });

    expect(mockedSendNoteByEmail).toHaveBeenCalledWith(
      '# My Note\nHello world',
      'My Note',
      undefined,
      '<h1>My Note</h1><p>Hello world</p>',
    );
  });

  it('derives the note title from the first line, stripping heading markers', async () => {
    const { app } = createAppWithEditor('## Weekly Summary\nContent');
    renderWithApp(<EmailGroup />, app);

    await act(async () => {
      fireEvent.click(screen.getByText('Email Page'));
    });

    expect(mockedSendNoteByEmail).toHaveBeenCalledWith(
      expect.any(String),
      'Weekly Summary',
      undefined,
      undefined,
    );
  });

  it('falls back to "Note" as title when the first line is empty', async () => {
    const { app } = createAppWithEditor('\nSecond line only');
    renderWithApp(<EmailGroup />, app);

    await act(async () => {
      fireEvent.click(screen.getByText('Email Page'));
    });

    expect(mockedSendNoteByEmail).toHaveBeenCalledWith(
      expect.any(String),
      'Note',
      undefined,
      undefined,
    );
  });

  it('is a no-op (no crash) when Email Page is clicked with no active editor', async () => {
    const app = createMockApp();
    renderWithApp(<EmailGroup />, app);

    await expect(
      act(async () => {
        fireEvent.click(screen.getByText('Email Page'));
      }),
    ).resolves.not.toThrow();

    expect(mockedSendNoteByEmail).not.toHaveBeenCalled();
  });
});

describe('EmailGroup — meeting details integration (integration)', () => {
  it('prepends meeting frontmatter to the editor content', () => {
    const { app, editor } = createAppWithEditor('Existing content');
    renderWithApp(<EmailGroup />, app);

    fireEvent.click(screen.getByText('Meeting Details'));

    const value = editor.getValue();
    expect(value).toMatch(/^---\nDate: \d{4}-\d{2}-\d{2}/);
    expect(value).toContain('Attendees:');
    expect(value).toContain('Agenda:');
    expect(value).toContain('Existing content');
  });

  it('is a no-op when Meeting Details is clicked with no active editor', () => {
    const app = createMockApp();
    renderWithApp(<EmailGroup />, app);
    expect(() =>
      fireEvent.click(screen.getByText('Meeting Details')),
    ).not.toThrow();
  });
});
