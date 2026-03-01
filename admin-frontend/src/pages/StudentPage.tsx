import React, { useState, useEffect } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Modal, Box } from '@mui/material';
import { getStudents, createStudent, updateStudent } from '../services/studentService';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const StudentPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<any>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const data = await getStudents();
        setStudents(data);
    };

    const handleOpen = (student?: any) => {
        setIsEdit(!!student);
        setCurrentStudent(student || {});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentStudent(null);
    };

    const handleSave = async () => {
        if (isEdit) {
            await updateStudent(currentStudent._id, currentStudent);
        } else {
            await createStudent(currentStudent);
        }
        fetchStudents();
        handleClose();
    };

    return (
        <Paper>
            <h1>Student Management</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                <FormControl style={{ minWidth: 120 }}>
                    <InputLabel>Filter by</InputLabel>
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <MenuItem value={'name'}>Name</MenuItem>
                        <MenuItem value={'competence'}>Competence</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Student</Button>
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Competences</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student._id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.competences?.join(', ')}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleOpen(student)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <h2>{isEdit ? 'Edit Student' : 'Add Student'}</h2>
                    <TextField
                        label="Name"
                        value={currentStudent?.name || ''}
                        onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        value={currentStudent?.email || ''}
                        onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <Button onClick={handleSave} color="primary" variant="contained">
                        Save
                    </Button>
                </Box>
            </Modal>
        </Paper>
    );
};

export default StudentPage;
