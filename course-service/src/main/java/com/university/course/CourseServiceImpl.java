package com.university.course;

import com.university.course.model.Course;
import jakarta.jws.WebService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Update this annotation line:
@WebService(
    endpointInterface = "com.university.course.CourseService",
    targetNamespace = "http://course.university.com/",
    serviceName = "CourseServiceImplService",
    portName = "CourseServiceImplPort"
)
public class CourseServiceImpl implements CourseService {

    private static Map<String, Course> courseDB = new HashMap<>();

    @Override
    public Course addCourse(String id, String name, String description, int credits) {
        // Log to verify it works
        System.out.println("SOA DEBUG: Adding Course - " + name); 
        
        Course newCourse = new Course(id, name, description, credits);
        courseDB.put(id, newCourse);
        return newCourse;
    }

    @Override
    public Course getCourseDetails(String id) {
        return courseDB.get(id);
    }

    @Override
    public List<Course> getAllCourses() {
        return new ArrayList<>(courseDB.values());
    }
}