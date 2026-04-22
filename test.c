// Online C compiler to run C program online
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>

#define BUFFER_SIZE 1024

void readFile(const char* filename){
    int fd = open(filename, O_RDONLY);
    if(fd == -1)
    {
        perror("Error came");
        return;
    }
    
    char buffer[BUFFER_SIZE];
    ssize_t bytesread;
    
    while((bytesread = read(fd, buffer, sizeof(buffer))) > 0)
    {
        write(STDOUT_FILENO, buffer, bytesread);
    }
    
    close(fd);
}

void copyFile(const char* source, const char* destination){
    int src_fd = open(source, O_RDONLY);
    if(src_fd == -1){
        perror("error");
        return;
    }
    
    int dest_fd = open(destination, O_WRONLY | O_CREAT , 0644);
    if(dest_fd == -1)
    {
        perror("Error brop");
        close(src_fd);
        return;
    }
    
    char buffer[BUFFER_SIZE];
    ssize_t bytesread;
    
    while((bytesread = read(src_fd, buffer, sizeof(buffer))) > 0){
        write(dest_fd, buffer, bytesread);
    }
    
    close(src_fd);
    close(dest_fd);
}

int main() {
    const char *filename = "example.txt";
    const char *destination = "copy_example.txt";

    printf("Reading file content:\n");
    readFile(filename);

    printf("\nCopying file content:\n");
    copyFile(filename, destination);

    printf("File copied successfully to %s\n", destination);
    return 0;
}