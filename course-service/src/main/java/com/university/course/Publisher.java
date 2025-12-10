package com.university.course;

import jakarta.xml.ws.Endpoint;

public class Publisher {
    public static void main(String[] args) {
        String url = "http://0.0.0.0:8082/ws/courses";
        System.out.println("Publishing Course Service at endpoint: " + url);
        Endpoint.publish(url, new CourseServiceImpl());
        System.out.println("Service Published successfully!");
    }
}
