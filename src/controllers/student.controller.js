import db from '../models/index.js';

/**
 * @swagger
 * tags:
 * - name: Students
 * description: Student management
 */

/**
 * @swagger
 * /students:
 * post:
 * summary: Create a new student
 * tags: [Students]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [name, email]
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * responses:
 * 201:
 * description: Student created
 * get:
 * summary: Get all students
 * tags: [Students]
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
 * description: List of students
 */
export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllStudents = async (req, res) => {
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
        const { count, rows } = await db.Student.findAndCountAll(options);
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
 * /students/{id}:
 * get:
 * summary: Get a student by ID
 * tags: [Students]
 * parameters:
 * - name: id
 * in: path
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
 * description: A student
 * 404:
 * description: Not found
 * put:
 * summary: Update a student
 * tags: [Students]
 * parameters:
 * - name: id
 * in: path
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
 * email:
 * type: string
 * responses:
 * 200:
 * description: Updated
 * delete:
 * summary: Delete a student
 * tags: [Students]
 * parameters:
 * - name: id
 * in: path
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Deleted
 */
export const getStudentById = async (req, res) => {
    const populate = req.query.populate;
    const options = {
        include: []
    };
    if (populate === 'courses') {
        options.include.push(db.Course);
    }
    try {
        const student = await db.Student.findByPk(req.params.id, options);
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};