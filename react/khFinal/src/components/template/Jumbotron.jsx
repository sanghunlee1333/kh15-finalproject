
export default function Jumbotron(
    {
        subject = "제목",
        content = "",
        ...rest
    }
) {
    return (
        <div className="row">
            <div className="col">
                <div className="bg-dark text-light p-4 rounded">
                    <h1>{subject}</h1>
                    <p>{content}</p>
                </div>
            </div>
        </div>
    );
}