import React, { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Box, Typography, TextField, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, InputAdornment } from '@mui/material/';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Import ArrowForwardIcon
import axios from 'axios';

const TodoList = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: dayjs(),
    completed: false,
  });
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:3001/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  const onHandle = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      ...formData,
      date: formData.date.format('YYYY-MM-DD'),
    };

    try {
      if (editingTaskId) {
        const res = await axios.put(`http://localhost:3001/tasks/${editingTaskId}`, {
          title: newTask.title,
          date: newTask.date,
        });
        setTasks(tasks.map(task => (task._id === editingTaskId ? { ...task, title: res.data.title, date: res.data.date } : task)));
      } else {
        const res = await axios.post('http://localhost:3001/tasks', newTask);
        setTasks([...tasks, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error('Error submitting task:', err);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: dayjs(), completed: false });
    setEditingTaskId(null);
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const updatedTask = await axios.put(`http://localhost:3001/tasks/${id}`, { completed: true });
      setTasks(tasks.map(task => (task._id === id ? { ...task, completed: true } : task)));
    } catch (err) {
      console.error('Error updating task completion:', err);
    }
  };

  const handleEdit = (task) => {
    setFormData({ title: task.title, date: dayjs(task.date), completed: task.completed });
    setEditingTaskId(task._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'Completed') return task.completed;
    if (filter === 'Pending') return !task.completed;
    return true;
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh', backgroundColor: 'beige' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            width: 400,
            height: 'auto',
            borderRadius: 5,
            bgcolor: 'white',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          component="form"
          onSubmit={handleSubmit}
        >
          <Typography sx={{ textAlign: 'center', padding: '10px' }}>TODO LIST</Typography>

          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            name="title"
            value={formData.title}
            onChange={onHandle}
            sx={{
              marginBottom: '20px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '40px',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <ArrowForwardIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="contained" color="primary" onClick={() => setFilter('All')}>All</Button>
            <Button variant="contained" color="success" onClick={() => setFilter('Completed')}>Completed</Button>
            <Button variant="contained" color="warning" onClick={() => setFilter('Pending')}>Pending</Button>
          </Stack>

          <TableContainer sx={{ marginTop: '20px', width: '100%', height: 200, overflow: 'auto', backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Table sx={{ backgroundColor: 'transparent' }}>
              
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell align="right">{task.title}</TableCell> {/* Align title to right */}
                    <TableCell align="right"> {/* Align actions to right */}
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end"> {/* Align icons to the end */}
                        {!task.completed ? (
                          <CheckCircleIcon
                            sx={{ color: '#3d5afe', cursor: 'pointer' }}
                            onClick={() => toggleTaskCompletion(task._id)} // Handle icon click to toggle completion
                          />
                        ) : (
                          // Placeholder when not completed
                          <span style={{ width: 24, height: 24 }}></span>
                        )}
                        {/* Edit button only for incomplete tasks */}
                        {!task.completed && (
                          <IconButton onClick={() => handleEdit(task)} color="primary">
                            <EditIcon />
                          </IconButton>
                        )}
                        {/* Always display the delete button at the end */}
                        <IconButton onClick={() => handleDelete(task._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default TodoList;
