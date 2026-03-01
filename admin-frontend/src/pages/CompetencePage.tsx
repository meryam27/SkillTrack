import React, { useState, useEffect } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Modal, Box } from '@mui/material';
import { getCompetences, createCompetence, updateCompetence } from '../services/competenceService';

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

const CompetencePage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [competences, setCompetences] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCompetence, setCurrentCompetence] = useState<any>(null);

    useEffect(() => {
        fetchCompetences();
    }, []);

    const fetchCompetences = async () => {
        const data = await getCompetences();
        setCompetences(data);
    };

    const handleOpen = (competence?: any) => {
        setIsEdit(!!competence);
        setCurrentCompetence(competence || {});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCompetence(null);
    };

    const handleSave = async () => {
        if (isEdit) {
            await updateCompetence(currentCompetence._id, currentCompetence);
        } else {
            await createCompetence(currentCompetence);
        }
        fetchCompetences();
        handleClose();
    };

    return (
        <Paper>
            <h1>Competence Management</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Competence</Button>
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {competences.map((competence) => (
                        <TableRow key={competence._id}>
                            <TableCell>{competence.name}</TableCell>
                            <TableCell>{competence.description}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleOpen(competence)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <h2>{isEdit ? 'Edit Competence' : 'Add Competence'}</h2>
                    <TextField
                        label="Name"
                        value={currentCompetence?.name || ''}
                        onChange={(e) => setCurrentCompetence({ ...currentCompetence, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        value={currentCompetence?.description || ''}
                        onChange={(e) => setCurrentCompetence({ ...currentCompetence, description: e.target.value })}
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

export default CompetencePage;
