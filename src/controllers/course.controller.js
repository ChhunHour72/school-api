import db from '../models/index.js';

/**
 * @swagger
 * tags:
 * - name: Courses
 * description: Course management
 */

/**
 * @swagger
 * /courses:
 * post:
 * summary: Create a new course
 * tags: [Courses]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [title, description, TeacherId]
 * properties:
 * title:
 * type: string
 * description:
 * type: string
 * TeacherId:
 * type: integer
 * responses:
 * 201:
 * description: Course created
 * get:
 * summary: Get all courses
 * tags: [Courses]
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
 * enum: [teacher, students]
 * responses:
 * 200:
 * description: List of courses
 */
export const createCourse = async (req, res) => {
    try {
        const course = await db.Course.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllCourses = async (req, res) => {

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

    if (populate === 'teacher') {
        options.include.push(db.Teacher);
    }
    if (populate === 'students') {
        options.include.push(db.Student);
    }

    try {
        const { count, rows } = await db.Course.findAndCountAll(options);
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
 * /courses/{id}:
 * get:
 * summary: Get a course by ID
 * tags: [Courses]
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
 * enum: [teacher, students]
 * responses:
 * 200:
 * description: Course found
 * 404:
 * description: Not found
 * put:
 * summary: Update a course
 * tags: [Courses]
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
 * title:
 * type: string
 * description:
 * type: string
 * TeacherId:
 * type: integer
 * responses:
 * 200:
 * description: Course updated
 * delete:
 * summary: Delete a course
 * tags: [Courses]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Course deleted
 */
export const getCourseById = async (req, res) => {
    const populate = req.query.populate;
    const options = {
        include: []
    };
    if (populate === 'teacher') {
        options.include.push(db.Teacher);
    }
    if (populate === 'students') {
        options.include.push(db.Student);
    }
    try {
        const course = await db.Course.findByPk(req.params.id, options);
        if (!course) return res.status(404).json({ message: 'Not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Not found' });
        await course.update(req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Not found' });
        await course.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};