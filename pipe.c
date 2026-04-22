#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>

#define BUFFER_SIZE 1024

int main() {
    int pipefds[2];
    char buffer[BUFFER_SIZE];
    pid_t pid;

    if (pipe(pipefds) == -1) {
        perror("Pipe creation failed");
        return 1;
    }

    pid = fork();
    if (pid < 0) {
        perror("Fork failed");
        return 1;
    }

    if (pid > 0) {
        close(pipefds[0]);

        char msg[] = "Hello from parent process!";
        write(pipefds[1], msg, strlen(msg) + 1);
        close(pipefds[1]);

        wait(NULL);
    } else {
        close(pipefds[1]);

        read(pipefds[0], buffer, sizeof(buffer));
        printf("Child process received message: %s\n", buffer);
        close(pipefds[0]);
    }

    return 0;
}