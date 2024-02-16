import styles from './Card.module.css';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { DndContext } from '@dnd-kit/core';
import {CSS } from '@dnd-kit/utilities';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import _ from 'lodash';
import axios from 'axios';
import handleTokenRefresh from '../Modules/Refresh';
import { FaEdit } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
export default function CustomCard({ currTask, handleEditTask, selectedTask, updatedTasks, list, id, isNew, cancelTask, allowEdit, searchKeyword }) {
    const [task, setTask] = useState(currTask);
    const [mouseIsOver, setMouseIsOver] = useState(false);
    let clicked = allowEdit?_.isEqual(task, selectedTask):false;
    let et = "";
    if (currTask.estimatedTime.days != 0)
        et += currTask.estimatedTime.days + " days";
    if (currTask.estimatedTime.hours != 0)
        et += currTask.estimatedTime.hours + " hours";

    const highlightKeyword = (title) => {
        if (!searchKeyword) {
            return title;
        }

        const regex = new RegExp(`(${searchKeyword})`, 'gi');
        return title.replace(regex, (match) => `<span class="`+styles.highlight+`">${match}</span>`);
    };

    // Render the task title with highlighted keywords
    const renderedTitle = highlightKeyword(currTask.title);

    function handleCancel() {
        if (task.id == "new") {
            cancelTask(id, task);
        } else
            handleEditTask(null);
    }
    function handleExpand() {
        if (!allowEdit)
            return;
        clicked=!clicked;
        clicked ? handleEditTask(currTask) : handleEditTask(null);
    }
    const getPriorityColor = () => {
        switch (task.priority) {
            case 2:
                return 'low';
            case 1:
                return 'medium';
            case 0:
                return 'high';
        }
    };

    const colors = {
        low: '#39AC95',
        medium: '#FE913E',
        high: '#DC3545',
    };
    function handleDateChange(e) {
        const newDate = dayjs(e).format('YYYY-MM-DD');
        if (dayjs(newDate).isValid()) {
            setTask((prevTask) => ({ ...prevTask, dueDate: newDate }));
        } else {
            console.error('Invalid date format. Please use YYYY-MM-DD.');
        }
    }

    function handlePriorityChange(e) {
        setTask((prevTask) => ({ ...prevTask, priority: Number(e) }));
    }

    function handleTimeChange(e, timeField) {
        const newValue = Number(e);
        if (!isNaN(newValue) && newValue >= 0) {
            setTask((prevTask) => ({
                ...prevTask,
                estimatedTime: {
                    ...prevTask.estimatedTime,
                    [timeField]: newValue,
                },
            }));
        } else {
            console.error('Invalid time value. Please enter a non-negative number.');
        }
    }

    function handleCategoryChange(e) {
        setTask((prevTask) => (
            { ...prevTask, category: e }
        ));
    }
    function handleTitleChange(e) {
        setTask((prevTask) => (
            { ...prevTask, title: e }
        ));
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { type: 'singleTask', task } });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };
    if (isDragging) {
        return (<div ref={setNodeRef} style={{ ...style, border: "2px red" }} className={styles.card} ></div>)
    }
    return (<>
        {!clicked && !(task.id == "new") && (
            <div className={styles.card} style={style} ref={setNodeRef} {...attributes} {...listeners} onMouseEnter={() => setMouseIsOver(true)} onMouseLeave={() => setMouseIsOver(false) }>
                <div className={styles.edit} onClick={handleExpand} ><FaEdit/></div>
                <div style={{ font: ' normal bold HelveticaNeue' }} dangerouslySetInnerHTML={{ __html: renderedTitle }}></div>
                {/*<CardHeader
                    sx={{ padding: '5px 0 0 5px', zIndex: 99, position: 'relative', color: 'black', textAlign: "left", textShadow: 'initial black', width: "100%" }}
                    titleTypographyProps={{ fontFamily: "Helvetica Neue Thin bolder", }}
                    title={task.title}
                />*/}

                <CardContent sx={{ padding: '2px' }}>
                    <Grid container spacing={2} className={styles.grid}>
                        <Grid item xs={5}>
                            <Typography variant="body1">Category:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <Typography variant="body1">
                                {task.category}
                            </Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="body1">Due Date:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <Typography variant="body1">{task.dueDate.slice(0, 10)}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="body1">Estimate:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <Typography variant="body1">{et}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="body1">Importance:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.priority}>
                            <Typography variant="body1" sx={{ bgcolor: colors[getPriorityColor()] }}>
                                {getPriorityColor()}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
        </div>
            )
        }
        {(clicked || (task.id == "new")) && (
            <div className={styles.card}>
                <div className={styles.edit} onClick={handleCancel} ><IoClose /></div>
                <TextField variant="standard" sx={{borderColor: !clicked?"transparent":"black"}} onChange={(e) => handleTitleChange(e.target.value)} value={task.title }></TextField>
                <CardContent sx={{ padding: '2px' }}>
                    <Grid container spacing={2} className={styles.grid+" "+styles.clicked}>
                        <Grid item xs={5}>
                            <Typography variant="body1">Category:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <TextField sx={{width:'80%'}} variant="standard" onChange={(e) => handleCategoryChange(e.target.value)} value={task.category }></TextField>
                        </Grid>

                        <Grid item xs={5}>
                            <Typography variant="body1">Due Date:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <input style={{ width: "90%" }} type="date" value={task.dueDate.slice(0, 10)} onChange={(e) => handleDateChange(e.target.value)} />
                        </Grid>

                        <Grid item xs={5}>
                            <Typography variant="body1">Estimate:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <Grid container spacing={2}>
                                <Grid item xs={5}>
                                    <TextField
                                        label="Days"
                                        type="number"
                                        min="0"
                                        sx={{width:'98%'}}
                                        value={task.estimatedTime.days}
                                        onChange={(e) => handleTimeChange(e.target.value, 'days')}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        label="Hours"
                                        type="number"
                                        min="0"
                                        sx={{width:'98%'}}
                                        value={task.estimatedTime.hours}
                                        onChange={(e) => handleTimeChange(e.target.value, 'hours')}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="body1">Importance:</Typography>
                        </Grid>
                        <Grid item xs={7} className={styles.values}>
                            <Select sx={{width:'70%'} }
                                value={task.priority}
                                onChange={(e) => handlePriorityChange(e.target.value)}>
                                <MenuItem value={0}>High</MenuItem>
                                <MenuItem value={1}>Medium</MenuItem>
                                <MenuItem value={2}>Low</MenuItem>
                            </Select>
                        </Grid>

                    </Grid>
                </CardContent>
                <button onClick={() => {
                    const { id, ...taskWithoutId } = task;
                    if (isNew) {
                        axios.post('https://localhost:7260/api/ToDoList', taskWithoutId, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                            .then(response => {
                                console.log(response.status);
                                console.log(response.data);
                                if (response.status === 200) {
                                    updatedTasks(id, [response.data, ...list]);
                                    setTask(response.data);
                                }
                            })
                            .catch(error => { handleTokenRefresh() });
                    }
                    else {
                        axios.put('https://localhost:7260/api/ToDoList/' + task.id, taskWithoutId, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                            .then(response => {
                                console.log(response.status);
                                console.log(response.data);
                                if (response.status === 200) {
                                    let[task, ...remaing] = list;
                                    updatedTasks(id, [task, ...remaing]);
                                }
                            })
                            .catch(error => { handleTokenRefresh() });
                    }
                    handleEditTask(null);
                }
                }>Save</button>
            </div>
        )}
    </>
    );
}