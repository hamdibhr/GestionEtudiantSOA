package com.university.course;

import com.university.course.model.Course;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;
import java.util.List;

// CRITICAL FIX: Set the namespace to EXACTLY what React uses
@WebService(targetNamespace = "http://course.university.com/") 
public interface CourseService {

    @WebMethod
    Course addCourse(
        @WebParam(name = "arg0") String id,          // Explicitly map arg0
        @WebParam(name = "arg1") String name,        // Explicitly map arg1
        @WebParam(name = "arg2") String description, // Explicitly map arg2
        @WebParam(name = "arg3") int credits         // Explicitly map arg3
    );

    @WebMethod
    Course getCourseDetails(@WebParam(name = "arg0") String id);

    @WebMethod
    List<Course> getAllCourses();
}