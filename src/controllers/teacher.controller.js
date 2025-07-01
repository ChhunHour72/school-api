import db from '../models/index.js';

/**
 * @swagger
 * tags:
 * - name: Teachers
 * description: Teacher management
 */

/**
 * @swagger
 * /teachers:
 * post:
 * summary: Create a new teacher
 * tags: [Teachers]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name, department]
 * properties:
 * name:
 * type: string
 * department:
 * type: string
 * responses:
 * 201:
 * description: Teacher created
 * get:
 * summary: Get all teachers
 * tags: [Teachers]
 * parameters:
 * - in: query
 * name: page
 * description: Page number
 * schema:
 * type: integer
 * default: 1
 * - in: query
 * name: limit
 * description: Number of items per page
 * schema:
 * type: integer
 * default: 10
 * - in: query
 * name: sort
 * description: Sort order by creation time
 * schema:
 * type: string
 * enum: [asc, desc]
 * default: desc
 * - in: query
 * name: populate
 * description: Populate with related data
 * schema:
 * type: string
 * enum: [courses]
 * responses:
 * 200:
 * description: List of teachers
 */
export const createTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllTeachers = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort === 'asc' ? 'ASC' : 'DESC';
    const populate = req.query.populate;

    const options = {
        limit: limit,
        offset: (page - 1) * limit,
        order: [['createdAt', sort]],
        include: []
    };

    if (populate === 'courses') {
        options.include.push(db.Course);
    }

    try {
        const { count, rows } = await db.Teacher.findAndCountAll(options);
        res.json({
            total: count,
            page: page,
            totalPages: Math.ceil(count / limit),
            data: rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 * get:
 * summary: Get a teacher by ID
 * tags: [Teachers]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * - in: query
 * name: populate
 * description: Populate with related data
 * schema:
 * type: string
 * enum: [courses]
 * responses:
 * 200:
 * description: Teacher found
 * 404:
 * description: Not found
 * put:
 * summary: Update a teacher
 * tags: [Teachers]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * department:
 * type: string
 * responses:
 * 200:
 * description: Updated
 * delete:
 * summary: Delete a teacher
 * tags: [Teachers]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Deleted
 */
export const getTeacherById = async (req, res) => {
    const populate = req.query.populate;
    const options = {
        include: []
    };
    if (populate === 'courses') {
        options.include.push(db.Course);
    }
    try {
        const teacher = await db.Teacher.findByPk(req.params.id, options);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.update(req.body);
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};