import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KanbanBoard } from './KanbanBoard';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('KanbanBoard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <KanbanBoard />
      </QueryClientProvider>
    );

  it('renders column headers for TODO, IN_PROGRESS, and DONE', () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IN_PROGRESS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'DONE' })).toBeInTheDocument();
  });

  it('renders tasks under their respective status columns', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', status: 'TODO' },
      { id: '2', title: 'Task 2', status: 'IN_PROGRESS' },
      { id: '3', title: 'Task 3', status: 'DONE' },
      { id: '4', title: 'Task 4', status: 'TODO' },
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    renderComponent();

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('Task 4')).toBeInTheDocument();

    const todoColumn = screen.getByRole('heading', { name: 'TODO' }).parentElement;
    const inProgressColumn = screen.getByRole('heading', { name: 'IN_PROGRESS' }).parentElement;
    const doneColumn = screen.getByRole('heading', { name: 'DONE' }).parentElement;

    expect(todoColumn).toHaveTextContent('Task 1');
    expect(todoColumn).toHaveTextContent('Task 4');
    expect(inProgressColumn).toHaveTextContent('Task 2');
    expect(doneColumn).toHaveTextContent('Task 3');
  });

  it('handles empty task response correctly', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3001/tasks');
    });

    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IN_PROGRESS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'DONE' })).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });

  it('ignores tasks with unknown status values', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', status: 'INVALID_STATUS' },
      { id: '2', title: 'Task 2', status: 'TODO' },
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    renderComponent();

    expect(await screen.findByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });

  it('handles network error during fetch without breaking header layout', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3001/tasks');
    });

    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IN_PROGRESS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'DONE' })).toBeInTheDocument();
  });

  it('fetches tasks from correct backend API endpoint', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:3001/tasks');
    });
  });
});